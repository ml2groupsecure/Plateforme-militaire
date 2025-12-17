#!/usr/bin/env python3
# -- coding: utf-8 --

from __future__ import annotations

import json
import logging
import os
import random
import re
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import feedparser
import folium
import requests
from bs4 import BeautifulSoup
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

# ============================================================
# 1. CONFIGURATION GROQ
# ============================================================

def _build_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY manquant (définissez-le dans python_api/.env ou dans vos variables d'environnement)")

    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    return ChatGroq(
        model_name=model_name,
        api_key=api_key,
        temperature=0.0,
        max_tokens=4000,
    )


# ============================================================
# 2. BASE DE DONNÉES GÉOGRAPHIQUE ÉTENDUE
# ============================================================

LOCATIONS_DB: Dict[str, List[float]] = {
    # Dakar et banlieue
    "UCAD": [14.6928, -17.4616],
    "Université Cheikh Anta Diop": [14.6928, -17.4616],
    "Campus Social": [14.6928, -17.4616],
    "Dakar": [14.7167, -17.4677],
    "Plateau": [14.6708, -17.4381],
    "Médina": [14.6830, -17.4550],
    "Colobane": [14.6960, -17.4500],
    "Sandaga": [14.6728, -17.4431],
    "Parcelles Assainies": [14.7640, -17.4229],
    "Grand Yoff": [14.7532, -17.4650],
    "Ouakam": [14.7160, -17.4850],
    "Ngor": [14.7450, -17.5100],
    "Yoff": [14.7470, -17.4920],
    "Mermoz": [14.7080, -17.4580],
    "Sacré-Coeur": [14.7120, -17.4620],
    "Point E": [14.7050, -17.4510],
    "Liberté 6": [14.7100, -17.4600],
    "HLM": [14.7200, -17.4400],
    "Sicap": [14.7300, -17.4500],
    "Fann": [14.6900, -17.4650],
    "Dieuppeul": [14.7340, -17.4690],
    "Gueule Tapée": [14.6850, -17.4480],
    "Fass": [14.6900, -17.4450],

    # Banlieue Dakar
    "Pikine": [14.7554, -17.3946],
    "Guédiawaye": [14.7734, -17.3891],
    "Thiaroye": [14.7667, -17.3333],
    "Keur Massar": [14.7828, -17.3117],
    "Malika": [14.7800, -17.3800],
    "Yeumbeul": [14.7900, -17.3700],
    "Diamaguène": [14.7600, -17.4000],
    "Cambérène": [14.7850, -17.4100],

    # Villes principales
    "Rufisque": [14.7167, -17.2667],
    "Thiès": [14.7910, -16.9359],
    "Mbour": [14.4220, -16.9638],
    "Kaolack": [14.1519, -16.0755],
    "Saint-Louis": [16.0333, -16.5000],
    "Ziguinchor": [12.5833, -16.2667],
    "Touba": [14.8500, -15.8833],
    "Louga": [15.6167, -16.2333],
    "Tambacounda": [13.7667, -13.6667],
    "Kolda": [12.8833, -14.9500],
    "Sédhiou": [12.7080, -15.5569],
    "Matam": [15.6556, -13.2553],
    "Kaffrine": [14.1064, -15.5503],
    "Kédougou": [12.5569, -12.1742],
    "Diourbel": [14.6525, -16.2358],
}

# Mots-clés géographiques du Sénégal (pour filtrage)
SENEGAL_GEO_KEYWORDS = [
    "sénégal",
    "senegal",
    "dakar",
    "pikine",
    "guédiawaye",
    "thiès",
    "mbour",
    "ucad",
    "université",
    "sacre coeur",
    "sacré-coeur",
    "campus",
    "touba",
    "kaolack",
    "saint-louis",
    "ziguinchor",
    "louga",
    "tambacounda",
    "kolda",
    "sédhiou",
    "matam",
    "kaffrine",
    "kédougou",
    "diourbel",
    "rufisque",
    "parcelles",
    "médina",
    "plateau",
    "yoff",
    "ouakam",
    "ngor",
    "grand yoff",
    "colobane",
    "sandaga",
    "ouest africain",
    "afrique de l'ouest",
    "cedeao",
    "uemoa",
]

# Sites d'actualités sénégalaises
SENEGAL_NEWS_SITES = [
    "https://www.seneweb.com",
    "https://www.dakaractu.com",
    "https://www.xalaattv.net",
    "https://www.pressafrik.com",
    "https://www.senenews.com",
    "https://www.leral.net",
    "http://www.aps.sn",
    "https://www.lequotidien.sn",
    "https://www.sudquotidien.sn",
    "https://www.lobservateur.sn",
]


# ============================================================
# 3. FILTRE GÉOGRAPHIQUE INTELLIGENT
# ============================================================

def is_senegal_related(text: str) -> bool:
    """Vérifie si un texte concerne le Sénégal (filtrage strict)."""
    text_lower = (text or "").lower()

    excluded_countries = [
        "états-unis",
        "usa",
        "amérique",
        "syrie",
        "syria",
        "irak",
        "iran",
        "israël",
        "palestine",
        "ukraine",
        "russie",
        "chine",
        "france",
        "espagne",
        "italie",
        "allemagne",
        "royaume-uni",
        "canada",
        "brésil",
        "argentine",
        "mexique",
        "japon",
        "corée",
        "inde",
        "pakistan",
        "égypte",
        "libye",
        "tunisie",
        "maroc",
        "algérie",
        "nigeria",
        "ghana",
        "kenya",
        "afrique du sud",
        "congo",
        "mali",
        "niger",
        "burkina",
        "guinée",
        "côte d'ivoire",
        "bénin",
        "togo",
        "cameroun",
    ]

    # Si mention d'un pays étranger, rejeter
    for country in excluded_countries:
        if country in text_lower:
            return False

    for keyword in SENEGAL_GEO_KEYWORDS:
        if keyword in text_lower:
            return True

    # Si aucun mot-clé et texte court, probablement pas Sénégal
    if len(text_lower) < 100:
        return False

    return False


# ============================================================
# 4. SCRAPER OPTIMISÉ AVEC FILTRAGE
# ============================================================

def find_rss_feed(home_url: str, timeout: int = 5) -> str:
    """Trouve le flux RSS d'un site."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    try:
        r = requests.get(home_url, timeout=timeout, headers=headers)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        link_tag = soup.find("link", attrs={"type": "application/rss+xml"})
        if link_tag and link_tag.get("href"):
            href = link_tag["href"]
            if href.startswith("/"):
                from urllib.parse import urljoin

                return urljoin(home_url, href)
            return href
    except Exception:
        pass

    for path in ["/rss", "/feed", "/feeds/posts/default", "/rss.xml", "/feed.xml"]:
        try:
            candidate = home_url.rstrip("/") + path
            rr = requests.get(candidate, timeout=timeout, headers=headers)
            if rr.status_code == 200 and (
                "xml" in rr.headers.get("content-type", "")
                or rr.text.strip().startswith("<?xml")
            ):
                return candidate
        except Exception:
            continue

    return ""


def scrape_senegal_news(limit_per_site: int = 10, global_limit: int = 30) -> List[Dict[str, Any]]:
    """Scrape uniquement les actualités sénégalaises liées à des incidents sensibles."""

    all_news: List[Dict[str, Any]] = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    keywords = [
        "manifestation",
        "tension",
        "affrontement",
        "mort",
        "blessé",
        "décès",
        "police",
        "grève",
        "ucad",
        "étudiant",
        "blocage",
        "violence",
        "marche",
        "protestation",
        "émeute",
        "gendarmerie",
        "confrontation",
        "crime",
        "vol",
        "braquage",
        "agression",
        "vandalisme",
        "incendie",
        "accident grave",
        "fermé",
        "perturbation",
        "trouble",
        "sécurité",
        "arrestation",
        "interpellation",
        "bavure",
        "répression",
        "chaos",
    ]

    for site in SENEGAL_NEWS_SITES:
        site_articles = 0

        # RSS
        rss_url = find_rss_feed(site)
        if rss_url:
            try:
                feed = feedparser.parse(rss_url)
                for entry in feed.entries[:20]:
                    title = entry.get("title", "")
                    summary = entry.get("summary", "") or entry.get("description", "")
                    full_text = f"{title} {summary}"

                    if not is_senegal_related(full_text):
                        continue

                    if any(kw in full_text.lower() for kw in keywords):
                        all_news.append(
                            {
                                "title": title,
                                "summary": (summary or "")[:200],
                                "date": entry.get("published", "Récent"),
                                "link": entry.get("link", site),
                                "source": site,
                            }
                        )
                        site_articles += 1
                        if site_articles >= limit_per_site:
                            break
            except Exception as e:
                logger.warning("Erreur RSS (%s): %s", site, str(e)[:200])

        # Fallback HTML
        if site_articles < max(3, limit_per_site // 2):
            try:
                r = requests.get(site, headers=headers, timeout=8)
                soup = BeautifulSoup(r.text, "html.parser")

                for tag in soup.find_all(["h1", "h2", "h3", "a"], limit=40):
                    text = tag.get_text(strip=True)
                    if len(text) < 20 or len(text) > 220:
                        continue

                    if not is_senegal_related(text):
                        continue

                    if any(kw in text.lower() for kw in keywords):
                        link = tag.get("href", site)
                        if isinstance(link, str) and link.startswith("/"):
                            from urllib.parse import urljoin

                            link = urljoin(site, link)

                        all_news.append(
                            {
                                "title": text,
                                "summary": "",
                                "date": "Récent",
                                "link": link,
                                "source": site,
                            }
                        )
                        site_articles += 1
                        if site_articles >= limit_per_site:
                            break
            except Exception as e:
                logger.warning("Erreur HTML (%s): %s", site, str(e)[:200])

        time.sleep(0.3)

        if len(all_news) >= global_limit:
            break

    return all_news[:global_limit]


# ============================================================
# 5. ANALYSE GROQ
# ============================================================

def _extract_json_object(text: str) -> str:
    # Retirer les fences ```json ... ```
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"```\s*$", "", cleaned.strip())

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return match.group(0)
    return cleaned


def analyze_with_groq(news_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyse IA: extraire des alertes structurées (JSON)."""

    if not news_list:
        return {"alerts": []}

    llm = _build_llm()

    news_text = ""
    for i, n in enumerate(news_list, 1):
        news_text += f"{i}. {n.get('title', '')}\n"
        summary = n.get("summary")
        if summary:
            news_text += f"   Résumé: {str(summary)[:150]}\n"
        news_text += "\n"

    valid_places = ", ".join(list(LOCATIONS_DB.keys())[:30])

    system_prompt = (
        "Tu es un expert en sécurité au Sénégal.\n\n"
        "MISSION CRITIQUE:\n"
        "- Analyser UNIQUEMENT les incidents au SÉNÉGAL\n"
        "- IGNORER toute actualité internationale (USA, Syrie, etc.)\n"
        "- Extraire UNIQUEMENT les lieux sénégalais\n\n"
        "RÈGLES ABSOLUES:\n"
        "1. Si un lieu n'est PAS au Sénégal → IGNORER l'alerte\n"
        "2. Répondre en JSON strict sans commentaire\n"
        "3. Utiliser UNIQUEMENT les lieux mentionnés dans les titres\n"
        "4. Maximum 12 alertes"
    )

    user_prompt = f"""Analyse ces actualités SÉNÉGALAISES et extrais les alertes:

{news_text}

LIEUX VALIDES SÉNÉGAL (utilise ces noms exacts si possibles):
{valid_places}

FORMAT OBLIGATOIRE:
{{
  "alerts": [
    {{
      "place": "Nom lieu sénégalais UNIQUEMENT",
      "type": "MANIFESTATION|VIOLENCE|GREVE|TENSION|BLOCAGE|ACCIDENT",
      "info": "Résumé 8 mots max",
      "severity": "FAIBLE|MOYEN|ÉLEVÉ"
    }}
  ]
}}

CRITÈRES SÉVÉRITÉ:
- ÉLEVÉ: Mort, blessés graves, violence armée
- MOYEN: Affrontements, tensions vives, blocages importants
- FAIBLE: Manifestations pacifiques, tensions mineures

ATTENTION: REJETTE tout lieu hors Sénégal (USA, Syrie, etc.)

JSON uniquement:"""

    try:
        response = llm.invoke(
            [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ]
        )

        raw = (response.content or "").strip()
        json_str = _extract_json_object(raw)
        data = json.loads(json_str)
        alerts = data.get("alerts", [])

        # Validation post-analyse (Sénégal uniquement)
        validated_alerts = []
        for alert in alerts:
            place = str(alert.get("place", ""))
            info = str(alert.get("info", ""))
            if is_senegal_related(f"{place} {info}"):
                validated_alerts.append(alert)

        return {"alerts": validated_alerts}

    except json.JSONDecodeError as e:
        logger.error("Erreur JSON Groq: %s", e)
        logger.debug("Réponse brute (début): %s", raw[:600])
        return {"alerts": []}
    except Exception as e:
        logger.error("Erreur Groq: %s", str(e)[:400])
        return {"alerts": []}


# ============================================================
# 6. CARTE
# ============================================================

def create_interactive_map(alerts: List[Dict[str, Any]]) -> folium.Map:
    m = folium.Map(
        location=[14.7167, -17.4677],
        zoom_start=11,
        tiles="CartoDB positron",
        prefer_canvas=True,
    )

    colors = {
        "FAIBLE": "green",
        "MOYEN": "orange",
        "ÉLEVÉ": "red",
        "ELEVÉ": "red",
    }

    icons_map = {
        "MANIFESTATION": "bullhorn",
        "VIOLENCE": "exclamation-triangle",
        "GREVE": "users",
        "TENSION": "warning",
        "BLOCAGE": "ban",
        "ACCIDENT": "car-crash",
    }

    for idx, alert in enumerate(alerts, 1):
        place = str(alert.get("place", "Dakar"))
        alert_type = str(alert.get("type", "TENSION"))
        info = str(alert.get("info", "Incident"))
        severity = str(alert.get("severity", "MOYEN"))

        coords = [14.7167, -17.4677]
        best_match = ""
        for loc, latlon in LOCATIONS_DB.items():
            if loc.lower() in place.lower() or place.lower() in loc.lower():
                coords = latlon
                best_match = loc
                break

        lat = coords[0] + random.uniform(-0.003, 0.003)
        lng = coords[1] + random.uniform(-0.003, 0.003)

        popup_html = f"""
        <div style='width:240px; font-family:Arial, sans-serif; padding:5px'>
            <h4 style='margin:0 0 8px 0; color:{colors.get(severity, "orange")};
                       font-size:16px; border-bottom:2px solid {colors.get(severity, "orange")}'>
                🚨 {alert_type}
            </h4>
            <p style='margin:4px 0'><b>📍 Lieu:</b> {place}</p>
            <p style='margin:4px 0'><b>⚠️ Niveau:</b>
               <span style='color:{colors.get(severity, "orange")}; font-weight:bold'>{severity}</span>
            </p>
            <p style='margin:4px 0'><b>ℹ️ Détails:</b> {info}</p>
            <p style='margin:6px 0 0 0; font-size:11px; color:#666'>
                Alerte #{idx} | {best_match if best_match else 'Localisation approximative'}
            </p>
        </div>
        """

        folium.Marker(
            location=[lat, lng],
            popup=folium.Popup(popup_html, max_width=270),
            tooltip=f"🚨 {alert_type} - {place} ({severity})",
            icon=folium.Icon(
                color=colors.get(severity, "orange"),
                icon=icons_map.get(alert_type, "exclamation-circle"),
                prefix="fa",
            ),
        ).add_to(m)

    legend_html = f"""
    <div style="position:fixed; bottom:60px; right:60px; z-index:1000;
                background:white; padding:18px; border:3px solid #2c3e50;
                border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.3);
                font-family:Arial, sans-serif">
        <h4 style="margin:0 0 12px 0; color:#2c3e50; font-size:16px">
            🛡️ Niveau d'Alerte
        </h4>
        <div style="margin:6px 0">
            <span style="color:green; font-size:20px">●</span>
            <span style="margin-left:8px">Faible (Surveillance)</span>
        </div>
        <div style="margin:6px 0">
            <span style="color:orange; font-size:20px">●</span>
            <span style="margin-left:8px">Moyen (Vigilance)</span>
        </div>
        <div style="margin:6px 0">
            <span style="color:red; font-size:20px">●</span>
            <span style="margin-left:8px">Élevé (Danger)</span>
        </div>
        <hr style="margin:10px 0; border:none; border-top:1px solid #ddd">
        <p style="margin:5px 0 0 0; font-size:11px; color:#666; text-align:center">
            {len(alerts)} alertes actives
        </p>
    </div>
    """
    m.get_root().html.add_child(folium.Element(legend_html))

    return m


def render_map_html(alerts: List[Dict[str, Any]]) -> str:
    m = create_interactive_map(alerts)
    return m.get_root().render()


# ============================================================
# 7. CACHE + PIPELINE
# ============================================================

_CACHE: Dict[str, Any] = {
    "timestamp": 0.0,
    "result": None,
}


def has_cached_result() -> bool:
    return _CACHE.get("result") is not None


def get_cached_result() -> Optional[Dict[str, Any]]:
    return _CACHE.get("result")


def run_radar(refresh: bool = False, cache_ttl_seconds: int = 600) -> Dict[str, Any]:
    now = time.time()

    if not refresh and _CACHE["result"] is not None:
        age = now - float(_CACHE["timestamp"])
        if age < cache_ttl_seconds:
            return _CACHE["result"]

    news = scrape_senegal_news()
    alerts_result = analyze_with_groq(news)

    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "news_count": len(news),
        "alerts": alerts_result.get("alerts", []),
        "sources": list({n.get("source") for n in news if n.get("source")}),
    }

    _CACHE["timestamp"] = now
    _CACHE["result"] = result
    return result
