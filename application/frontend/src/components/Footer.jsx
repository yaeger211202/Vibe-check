import { Link } from "react-router-dom";
import footerBg from "../assets/footer/background.png";

export default function Footer() {
    return (
        <footer className=" relative">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url(${footerBg})` }}
            />

            <div className="relative max-w-6xl mx-auto flex justify-between items-center px-6 py-6 text-sm text-gray-700">
                <span className="text-white font-bold">© ARKHA</span>
                <Link to="/team" className="text-white font-bold hover:underline">
                    Meet Our Team ❤️
                </Link>
            </div>
        </footer>
    );
}