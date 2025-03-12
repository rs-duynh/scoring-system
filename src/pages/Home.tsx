import QRCode from 'react-qr-code';

const Home = () => {
  // Lấy current URL của website
  const loginUrl = `${window.location.origin}/login`;
  const isMobile = window.innerWidth <= 768;
  return (
    <div className="bg-custom flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="rounded-lg shadow-md mt-50">
        <div className="p-3 bg-white boxShadow">
          <QRCode
            value={loginUrl}
            size={128}
            style={{ height: "auto", maxWidth: isMobile ? "200px" : "240px", width: isMobile ? "200px"  : "240px" }}
          />
          <span> </span>
          <span> </span>
          <span> </span>
          <span> </span>
        </div>
       
      </div>
    </div>
  );
};

export default Home;