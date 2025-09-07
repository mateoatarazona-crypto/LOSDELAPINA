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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con información del usuario */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido, {session.user?.name || session.user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
        <div className="space-y-8 animate-fade-in-up">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <Kpi title="Fechas este mes" value={kpis.eventosDelMes} icon="📅" />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <Kpi title="Ingresos negociados" value={kpis.ingresos} money icon="💰" />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <Kpi
            title="Anticipos pendientes"
            value={`$${Intl.NumberFormat('es-CO').format(
              kpis.anticiposPendientesTotal
            )}`}
            icon="⏳"
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <Kpi
            title="Segundos pagos pendientes"
            value={`$${Intl.NumberFormat('es-CO').format(
              kpis.segundosPendientesTotal
            )}`}
            icon="💳"
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <Kpi title="Gastos totales" value={kpis.gastosTotales} money icon="📊" />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <Kpi title="Utilidad estimada" value={kpis.utilidadEstim} money icon="📈" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-green-900/20 to-black/40 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
        <h2 className="font-heading text-2xl text-neon floating-3d mb-6 text-center">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            color="from-purple-500/20 to-purple-700/20"
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
            color="from-emerald-500/20 to-emerald-700/20"
          />
          <QuickActionCard
            href="/calendario"
            title="Calendario"
            description="Planificar nuevos eventos"
            icon="📅"
            color="from-green-500/20 to-green-700/20"
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
    <div className="p-6 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-gray-600 uppercase tracking-wider font-semibold">{title}</h3>
        {icon && (
          <span className="text-3xl">
            {icon}
          </span>
        )}
      </div>
      <p className="text-4xl text-gray-900">
        {formatValue(value)}
      </p>
      <div className="mt-3 h-1 bg-gray-300 rounded-full"></div>
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
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
        <div className="mb-4">
          <div className="text-4xl">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-semibold">
            Ir →
          </span>
        </div>
      </div>
    </Link>
  )
}