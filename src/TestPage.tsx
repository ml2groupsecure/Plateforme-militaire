// Page de test ultra-simple
const TestPage = () => {
  return (
    <div style={{
      padding: '50px',
      fontSize: '24px',
      color: '#000',
      backgroundColor: '#fff'
    }}>
      <h1>🎯 Test seentuDash</h1>
      <p>✅ React fonctionne</p>
      <p>✅ TypeScript fonctionne</p>
      <p>Date: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestPage;