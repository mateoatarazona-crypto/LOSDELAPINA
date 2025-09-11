'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Music, BarChart3, Settings, LogOut } from 'lucide-react';

interface KpisData {
  eventosDelMes: number;
  ingresos: number;
  gastosTotales: number;
  anticiposPendientesTotal: number;
  segundosPendientesTotal: number;
  utilidadEstim: number;
}

async function getKpis(params: URLSearchParams): Promise<KpisData> {
  const month = params.get('month') || new Date().getMonth().toString();
  const year = params.get('year') || new Date().getFullYear().toString();
  
  const response = await fetch(`/api/dashboard/kpis?month=${month}&year=${year}`);
  if (!response.ok) {
    throw new Error('Error fetching KPIs');
  }
  return response.json();
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [kpis, setKpis] = useState<KpisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    const loadKpis = async () => {
      try {
        const params = new URLSearchParams();
        const data = await getKpis(params);
        setKpis(data);
      } catch (error) {
        console.error('Error loading KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKpis();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Error cargando datos...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header con información del usuario */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
            <p className="font-caption mt-1 text-sm sm:text-base">Bienvenido, {session.user?.name || session.user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <LogOut className="h-4 w-4" />
            <span className="sm:inline">Cerrar Sesión</span>
          </button>
        </div>
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <Kpi title="Fechas este mes" value={kpis.eventosDelMes} icon="📅" />
        </div>
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <Kpi title="Ingresos negociados" value={kpis.ingresos} money icon="💰" />
        </div>
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <Kpi
            title="Anticipos pendientes"
            value={`$${Intl.NumberFormat('es-CO').format(
              kpis.anticiposPendientesTotal
            )}`}
            icon="⏳"
          />
        </div>
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <Kpi
            title="Segundos pagos pendientes"
            value={`$${Intl.NumberFormat('es-CO').format(
              kpis.segundosPendientesTotal
            )}`}
            icon="💳"
          />
        </div>
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <Kpi title="Gastos totales" value={kpis.gastosTotales} money icon="📊" />
        </div>
        <div className="card hover:scale-[1.02] transition-transform duration-200">
          <Kpi title="Utilidad estimada" value={kpis.utilidadEstim} money icon="📈" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-4 sm:p-6 lg:p-8">
        <h2 className="font-display text-xl sm:text-2xl mb-4 sm:mb-6 text-center" style={{ color: 'var(--foreground)' }}>Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <QuickActionCard
            href="/fechas"
            title="Gestionar Fechas"
            description="Ver y administrar eventos programados"
            icon="🎵"
            color="from-blue-500/20 to-blue-700/20"
          />
          <QuickActionCard
            href="/artistas"
            title="Artistas"
            description="Administrar perfiles de artistas"
            icon="🎤"
            color="from-magenta-500/20 to-magenta-700/20"
          />
          <QuickActionCard
            href="/empresarios"
            title="Empresarios"
            description="Gestionar contactos empresariales"
            icon="💼"
            color="from-orange-500/20 to-orange-700/20"
          />
          <QuickActionCard
            href="/utilidades"
            title="Utilidades"
            description="Analizar rentabilidad por fecha"
            icon="📈"
            color="from-cyan-500/20 to-cyan-700/20"
          />
          <QuickActionCard
            href="/calendario"
            title="Calendario"
            description="Planificar nuevos eventos"
            icon="📅"
            color="from-magenta-500/20 to-magenta-700/20"
          />
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  title,
  value,
  money = false,
  icon,
}: {
  title: string
  value: number | string
  money?: boolean
  icon?: string
}) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (money) {
      return `$${Intl.NumberFormat('es-CO').format(val)}`;
    }
    return Intl.NumberFormat('es-CO').format(val);
  };

  return (
    <div className="card p-4 sm:p-6 cursor-pointer">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="font-caption uppercase tracking-wide text-xs sm:text-sm">{title}</h3>
        {icon && (
          <span className="text-xl sm:text-2xl text-accent">
            {icon}
          </span>
        )}
      </div>
      <p className="font-display text-2xl sm:text-3xl mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>
        {formatValue(value)}
      </p>
      <div className="h-1 rounded-full" style={{ background: 'var(--gradient-primary)' }}></div>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  icon,
  color
}: {
  href: string
  title: string
  description: string
  icon: string
  color: string
}) {
  return (
    <Link href={href} className="group">
      <div className="card p-4 sm:p-6 group-hover:scale-[1.02] transition-all duration-200 h-full">
        <div className="mb-3 sm:mb-4">
          <div className="text-2xl sm:text-3xl text-accent">
            {icon}
          </div>
        </div>
        <h3 className="font-heading text-base sm:text-lg mb-2">
          {title}
        </h3>
        <p className="font-body text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-caption text-accent font-medium group-hover:translate-x-1 transition-transform duration-200 text-xs sm:text-sm">
            Ir →
          </span>
        </div>
      </div>
    </Link>
  )
}