import Tutch from './Tutch';

function App() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          flexGrow: 1,
          lineHeight: '20px',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          paddingLeft: 10,
          backgroundColor: 'aliceblue',
        }}
      >
        <h1>Tutch</h1>
      </header>
      <main
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          height: 'calc(100vh - 80px)',
        }}
      >
        <Tutch />
      </main>
      <footer
        style={{
          flexGrow: 1,
          fontSize: 12,
          color: 'darkslateblue',
          backgroundColor: 'aliceblue',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 10,
        }}
      >
        <p style={{ padding: 0, margin: 0 }}>
          Based on the design of{' '}
          <a href="https://www2.tcs.ifi.lmu.de/~abel/tutch/">Andreas Abel and others</a>. This
          implementation by <a href="https://www.convivial.tools/">Chris Martens</a> and{' '}
          <a href="https://github.com/robsimmons">Rob Simmons</a>.{' '}
          <a href="https://github.com/retutch/retutch.github.io">View this site on GitHub.</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
