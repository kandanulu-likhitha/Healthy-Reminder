import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Pill, ArrowRight } from 'lucide-react';

interface DiseaseCardProps {
  id: string;
  name: string;
  medications: string[];
  description: string;
  backgroundImage: string;
}

const DiseaseCard = ({ id, name, medications, description, backgroundImage }: DiseaseCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-medical transition-all duration-300 bg-card">
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-background/90">
            <Pill className="w-3 h-3 mr-1" />
            {medications.length} medications
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Common Medications:</p>
            <div className="flex flex-wrap gap-1">
              {medications.slice(0, 3).map((med, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {med}
                </Badge>
              ))}
              {medications.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{medications.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="w-4 h-4 mr-1" />
              Daily management
            </div>
            <Link to={`/disease/${id}`}>
              <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseCard;