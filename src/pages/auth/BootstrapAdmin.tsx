import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { supabase } from '../../lib/supabase';

export default function BootstrapAdmin() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
        body: { name, email, password },
        headers: { 'x-bootstrap-token': token },
      });

      if (error) throw error;

      setMessage(`✅ Admin créé: ${(data as any)?.data?.email || email}`);
      setTimeout(() => navigate('/auth/login'), 800);
    } catch (err: any) {
      setMessage(`❌ ${err?.message || 'Erreur création admin'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Bootstrap Admin" subtitle="Création du premier administrateur">
      <div className="max-w-xl mx-auto">
        <Card>
          <div className="space-y-2 mb-4">
            <h2 className="text-xl font-semibold text-neuro-900 dark:text-white">Créer le premier admin</h2>
            <p className="text-sm text-neuro-600 dark:text-gray-400">
              Page de bootstrap (à utiliser une seule fois). Elle nécessite le token serveur.
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm mb-4 ${message.startsWith('✅') ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-danger-50 text-danger-700 border border-danger-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">Nom</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Administrateur" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@exemple.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">Mot de passe (min. 6 caractères)</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neuro-700 dark:text-gray-300 mb-2">Token bootstrap</label>
              <Input value={token} onChange={e => setToken(e.target.value)} placeholder="BOOTSTRAP_ADMIN_TOKEN" required />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Création...' : 'Créer admin'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
