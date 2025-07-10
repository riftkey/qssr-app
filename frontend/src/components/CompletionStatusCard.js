import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

const CompletionStatusCard = ({ total, completed }) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;


  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="font-bold text-lg mb-2">Status Penyelesaian</h2>
        <p>{completed} dari {total} indikator sudah diisi</p>
        <Progress value={percentage} className="mt-2" />
      </CardContent>
    </Card>
  );
};

export default CompletionStatusCard;
