import { Card, CardContent } from "../components/ui/card";
import { Link } from "react-router-dom";

const MissingDataCard = ({ missingIndicators }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="font-bold text-lg mb-2">Data yang Kurang</h2>
        <div className="max-h-48 overflow-y-auto pr-2"> {/* Tambahkan ini */}
          <ul className="list-disc pl-5 space-y-1 text-blue-500">
            {missingIndicators.map((item, index) => {
              const [kode, nama] = item.split(": ");
              return (
                <li key={index}>
                  <Link
                    to={`/indicator-list?kode=${encodeURIComponent(kode)}`}
                    className="hover:underline"
                  >
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissingDataCard;
