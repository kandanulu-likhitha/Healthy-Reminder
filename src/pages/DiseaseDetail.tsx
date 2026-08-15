import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDiseaseById } from '@/data/diseases';
import { Clock, ShoppingCart, ArrowLeft, Utensils, Pill, Lightbulb, AlertTriangle } from 'lucide-react';

const DiseaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const disease = getDiseaseById(id!);

  if (!disease) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Disease not found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const mealTimes = [
    { key: 'morning' as const, label: 'Morning', icon: '🌅' },
    { key: 'afternoon' as const, label: 'Afternoon', icon: '☀️' },
    { key: 'evening' as const, label: 'Evening', icon: '🌆' },
    { key: 'night' as const, label: 'Night', icon: '🌙' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${disease.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-fit mb-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Diseases
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">{disease.name}</h1>
          <p className="text-xl text-white/90 max-w-2xl">{disease.description}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Medications Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">Common Medications</h2>
              </div>

              <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-warning flex-shrink-0" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Educational reference only.</span>{' '}
                  Medicine names, dosages, and timings vary per patient. Always follow your doctor's prescription — never self-medicate.
                </p>
              </div>

              <div className="space-y-3">
                {disease.medications.map((med, index) => (
                  <div key={index} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">{med.name}</span>
                      <Badge variant="secondary" className="text-xs">{med.category}</Badge>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dosage</dt>
                        <dd>{med.dosage}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Frequency</dt>
                        <dd>{med.frequency}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">When to take</dt>
                        <dd>{med.timing}</dd>
                      </div>
                    </dl>
                    {med.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Note: </span>{med.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Meal Plan Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Utensils className="w-6 h-6 text-secondary" />
                <h2 className="text-2xl font-semibold">Daily Meal Plan</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {mealTimes.map((mealTime) => (
                  <div key={mealTime.key} className="space-y-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <span className="text-2xl">{mealTime.icon}</span>
                      {mealTime.label}
                    </h3>
                    <ul className="space-y-2">
                      {disease.mealPlan[mealTime.key].map((food, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-2 h-2 bg-secondary rounded-full" />
                          {food}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tips Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-medical" />
                <h2 className="text-2xl font-semibold">Health Tips</h2>
              </div>
              <ul className="space-y-3">
                {disease.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-medical/10 text-medical rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate(`/reminders/new?disease=${disease.id}`)}
                  className="w-full justify-start"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Set Medication Reminder
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/shop?disease=${disease.id}`)}
                  className="w-full justify-start"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Find Nearby Pharmacies
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Important Reminder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Always consult with your healthcare provider before making changes to your medication or diet plan.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Doctor
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetail;