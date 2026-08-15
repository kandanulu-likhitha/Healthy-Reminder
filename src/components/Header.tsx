import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  User,
  Bell,
  ShoppingCart,
  Stethoscope,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Boxes,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { count: cartCount } = useCart();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const [profileResult, roleResult] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('user_id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
    ]);

    if (profileResult.data) {
      setProfile(profileResult.data);
    }
    if (roleResult.data) {
      setRole(roleResult.data.role);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setProfile(null);
    setRole(null);
    navigate('/');
  };

  const getRoleBadge = () => {
    if (!role) return null;
    const roleLabels: Record<AppRole, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      user: { label: 'Patient', variant: 'secondary' },
      doctor: { label: 'Doctor', variant: 'default' },
      pharmacy: { label: 'Pharmacy', variant: 'outline' }
    };
    return roleLabels[role];
  };

  const patientNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/daily-log', label: 'Daily Log', icon: Heart },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/shop', label: 'Pharmacy', icon: ShoppingCart },
    { path: '/orders', label: 'Orders', icon: Package },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
  ];
  const doctorNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard?tab=emergencies', label: 'Emergencies', icon: Bell },
    { path: '/dashboard?tab=patients', label: 'Patients', icon: Users },
    { path: '/dashboard?tab=consultations', label: 'Consultations', icon: ClipboardList },
    { path: '/profile', label: 'Profile', icon: User },
  ];
  const pharmacyNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard?tab=orders', label: 'Orders', icon: Package },
    { path: '/dashboard?tab=inventory', label: 'Inventory', icon: Boxes },
    { path: '/profile', label: 'Profile', icon: User },
  ];
  const navItems = !user
    ? patientNav
    : role === 'doctor'
    ? doctorNav
    : role === 'pharmacy'
    ? pharmacyNav
    : patientNav;
  const showCart = !role || role === 'user';

  const roleBadgeInfo = getRoleBadge();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Healthy Reminder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive(path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {showCart && <Link to="/cart" className="relative">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <Badge className="ml-1 h-5 min-w-5 px-1.5 rounded-full text-xs">{cartCount}</Badge>
                    )}
                  </Button>
                </Link>}
                <div className="flex items-center gap-2">
                  {roleBadgeInfo && (
                    <Badge variant={roleBadgeInfo.variant}>{roleBadgeInfo.label}</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {user && (
              <div className="px-3 py-2 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile?.full_name || user.email?.split('@')[0]}</span>
                {roleBadgeInfo && (
                  <Badge variant={roleBadgeInfo.variant} className="text-xs">{roleBadgeInfo.label}</Badge>
                )}
              </div>
            )}
            <nav className="flex flex-col space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-border mt-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
