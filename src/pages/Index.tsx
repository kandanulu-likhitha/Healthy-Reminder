import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DiseaseCard from '@/components/DiseaseCard';
import { getAllDiseases } from '@/data/diseases';
import { Search, Heart, Shield, Clock, Utensils } from 'lucide-react';
import heroImage from '@/assets/hero-medical.jpg';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const diseases = getAllDiseases();
  
  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-96 bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Healthy Remainder
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your comprehensive health companion for managing chronic conditions with personalized medication reminders and meal planning
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-accent/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Healthy Remainder?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center shadow-card-soft">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
              <p className="text-muted-foreground">Personalized medication and meal reminders tailored to your condition and schedule</p>
            </Card>
            <Card className="p-6 text-center shadow-card-soft">
              <Utensils className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Meal Planning</h3>
              <p className="text-muted-foreground">Disease-specific nutrition guidance with meal plans from morning to night</p>
            </Card>
            <Card className="p-6 text-center shadow-card-soft">
              <Shield className="w-12 h-12 text-medical mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Health Tracking</h3>
              <p className="text-muted-foreground">Comprehensive tracking and nearby pharmacy integration for seamless care</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Disease Management Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Conditions We Support</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive management for chronic diseases requiring daily medication and lifestyle monitoring
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search conditions or medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Disease Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease) => (
              <DiseaseCard
                key={disease.id}
                id={disease.id}
                name={disease.name}
                medications={disease.medications.map(m => m.name)}
                description={disease.description}
                backgroundImage={disease.backgroundImage}
              />
            ))}
          </div>

          {filteredDiseases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No conditions found matching "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
