import { Link } from 'react-router-dom';

const Logo = ({ className = "" }) => {
  return (
    <Link to="/" className={`transition-transform duration-300 hover:scale-105 ${className}`}>
      <div className="flex items-center justify-center">
        <div className="relative">
          <span className="text-4xl font-extrabold text-[#1c3860] tracking-tight">SV</span>
          <span className="text-4xl font-extrabold text-[#dbac56] tracking-tight">PROFILES</span>
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#dbac56] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
