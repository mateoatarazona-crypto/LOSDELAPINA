'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EventoUtilidad {
  id: number;
  fechaEvento: string;
  estado: string;
  ciudad: string;
  venue: string;
  empresario: string;
  artistas: string;
  financiero: {
    ingresoTotal: number;
    gastosTotal: number;
    pagoArtistas: number;
    ingresoCasa: number;
    utilidadBruta: number;
    margenUtilidad: number;
  };
  resumen: {
    totalGastos: number;
    totalArtistas: number;
    rentable: boolean;
  };
}

interface Estadisticas {
  totalEventos: number;
  eventosRentables: number;
  ingresosTotales: number;
  gastosTotales: number;
  utilidadTotal: number;
  margenPromedioUtilidad: number;
}

interface UtilidadesData {
  eventos: EventoUtilidad[];
  estadisticas: Estadisticas;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEstadoBadgeColor = (estado: string) => {
  const colors: Record<string, string> = {
    'Propuesta': 'bg-gray-100 text-gray-800',
    'Negociacion': 'bg-yellow-100 text-yellow-800',
    'Contratada': 'bg-blue-100 text-blue-800',
    'PendienteAnticipo': 'bg-orange-100 text-orange-800',
    'Confirmada': 'bg-green-100 text-green-800',
    'Ejecutada': 'bg-purple-100 text-purple-800',
    'Cerrada': 'bg-gray-100 text-gray-800',
    'Cancelada': 'bg-red-100 text-red-800',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
};

// Iconos SVG
const DollarSignIcon = () => (
  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default function UtilidadesPage() {
  const [data, setData] = useState<UtilidadesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUtilidades = async () => {
      try {
        const response = await fetch('/api/fechas/utilidades');
        if (!response.ok) {
          throw new Error('Error al cargar las utilidades');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUtilidades();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando utilidades...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  const { eventos, estadisticas } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilidades por Fecha</h1>
        <div className="text-sm text-gray-600">
          {eventos.length} eventos registrados
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Ingresos Totales</h3>
            <DollarSignIcon />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(estadisticas.ingresosTotales)}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Utilidad Total</h3>
            <TrendingUpIcon />
          </div>
          <div className={`text-2xl font-bold ${
            estadisticas.utilidadTotal >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(estadisticas.utilidadTotal)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Margen Promedio</h3>
            <TrendingUpIcon />
          </div>
          <div className={`text-2xl font-bold ${
            estadisticas.margenPromedioUtilidad >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {estadisticas.margenPromedioUtilidad.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Eventos Rentables</h3>
            <CalendarIcon />
          </div>
          <div className="text-2xl font-bold">
            {estadisticas.eventosRentables}/{estadisticas.totalEventos}
          </div>
          <p className="text-xs text-gray-500">
            {((estadisticas.eventosRentables / estadisticas.totalEventos) * 100).toFixed(1)}% rentables
          </p>
        </div>
      </div>

      {/* Tabla de Eventos */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Detalle por Evento</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Ciudad/Venue</th>
                  <th className="text-left p-2">Artistas</th>
                  <th className="text-right p-2">Ingresos</th>
                  <th className="text-right p-2">Gastos</th>
                  <th className="text-right p-2">Utilidad</th>
                  <th className="text-right p-2">Margen</th>
                  <th className="text-center p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{formatDate(evento.fechaEvento)}</div>
                    </td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeColor(evento.estado)}`}>
                        {evento.estado}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">{evento.ciudad}</div>
                        <div className="text-gray-600">{evento.venue}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm max-w-32 truncate" title={evento.artistas}>
                        {evento.artistas}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="font-medium">
                        {formatCurrency(evento.financiero.ingresoTotal)}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="text-red-600">
                        {formatCurrency(evento.financiero.gastosTotal)}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className={`font-medium ${
                        evento.financiero.utilidadBruta >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(evento.financiero.utilidadBruta)}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className={`font-medium ${
                        evento.financiero.margenUtilidad >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {evento.financiero.margenUtilidad.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <Link href={`/utilidades/${evento.id}`}>
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <EyeIcon />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}