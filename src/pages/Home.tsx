import QRCode from 'react-qr-code';

const Home = () => {
  // Lấy current URL của website
  const loginUrl = `${window.location.origin}/login`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Scan QR Code to Login</h1>
        <div className="p-4 bg-white">
          <QRCode
            value={loginUrl}
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>
        <p className="mt-4 text-center text-gray-600">
          Scan mã QR code để truy cập trang đăng nhập
        </p>
      </div>
    </div>
  );
};

export default Home;