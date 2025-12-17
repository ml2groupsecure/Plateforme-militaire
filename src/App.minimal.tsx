// Version ultra-minimale
function App() {
  return (
    <div>
      <h1>seentuDash - Test Minimal</h1>
      <p>Si tu vois ce message, React fonctionne</p>
      <div style={{ 
        padding: '20px', 
        margin: '20px', 
        backgroundColor: '#e0f7fa', 
        border: '2px solid #0097a7' 
      }}>
        <h2>✅ Statut</h2>
        <ul>
          <li>✅ React : OK</li>
          <li>✅ Vite : OK</li>
          <li>✅ TypeScript : OK</li>
          <li>⏰ Heure : {new Date().toLocaleTimeString()}</li>
        </ul>
      </div>
    </div>
  );
}

export default App;