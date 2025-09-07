'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventoDetalle {
  evento: {
    id: number;
    fechaEvento: string;
    estado: string;
    ciudad: string;
    venue: string;
    empresario: string;
  };
  financiero: {
    ingresoTotal: number;
    gastosTotal: number;
    pagoArtistas: number;
    ingresoCasa: number;
    utilidadBruta: number;
    margenUtilidad: number;
  };
  porcentajes: {
    artistas: number;
    casa: number;
  };
  gastosPorCategoria: Record<string, {
    total: number;
    gastos: Array<{
      id: number;
      descripcion: string;
      monto: number;
      comprobanteUrl: string | null;
    }>;
  }>;
  artistasDetalle: Array<{
    id: number;
    nombre: string;
    porcentaje: number;
    pago: number;
  }>;
  resumen: {
    totalGastos: number;
    totalArtistas: number;
    rentable: boolean;
  };
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
    month: 'long',
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
const ArrowLeftIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

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

const UsersIcon = () => (
  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

export default function UtilidadDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<EventoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventoId = params.id as string;

  useEffect(() => {
    const fetchUtilidad = async () => {
      try {
        const response = await fetch(`/api/fechas/${eventoId}/utilidades`);
        if (!response.ok) {
          throw new Error('Error al cargar la utilidad del evento');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (eventoId) {
      fetchUtilidad();
    }
  }, [eventoId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando detalles...</div>
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

  const { evento, financiero, porcentajes, gastosPorCategoria, artistasDetalle, resumen } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/utilidades">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeftIcon />
              <span className="ml-2">Volver</span>
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{formatDate(evento.fechaEvento)}</h1>
            <p className="text-gray-600">{evento.ciudad} - {evento.venue}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadgeColor(evento.estado)}`}>
          {evento.estado}
        </span>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Ingreso Total</h3>
            <DollarSignIcon />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(financiero.ingresoTotal)}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Gastos Totales</h3>
            <TrendingUpIcon />
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(financiero.gastosTotal)}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Utilidad Bruta</h3>
            <TrendingUpIcon />
          </div>
          <div className={`text-2xl font-bold ${
            financiero.utilidadBruta >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(financiero.utilidadBruta)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Margen</h3>
            <TrendingUpIcon />
          </div>
          <div className={`text-2xl font-bold ${
            financiero.margenUtilidad >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {financiero.margenUtilidad.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Desglose de Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <UsersIcon />
              <span className="ml-2">Reparto de Ingresos</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Casa ({porcentajes.casa}%)</span>
                <span className="font-bold">{formatCurrency(financiero.ingresoCasa)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Artistas ({porcentajes.artistas}%)</span>
                <span className="font-bold">{formatCurrency(financiero.pagoArtistas)}</span>
              </div>
            </div>

            {artistasDetalle.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3">Detalle por Artista</h3>
                <div className="space-y-2">
                  {artistasDetalle.map((artista) => (
                    <div key={artista.id} className="flex justify-between items-center text-sm">
                      <span>{artista.nombre} ({artista.porcentaje}%)</span>
                      <span className="font-medium">{formatCurrency(artista.pago)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gastos por Categoría */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Gastos por Categoría</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(gastosPorCategoria).map(([categoria, datos]) => (
                <div key={categoria} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{categoria}</h3>
                    <span className="font-bold text-red-600">{formatCurrency(datos.total)}</span>
                  </div>
                  <div className="space-y-1">
                    {datos.gastos.map((gasto) => (
                      <div key={gasto.id} className="flex justify-between items-center text-sm text-gray-600">
                        <span>{gasto.descripcion || 'Sin descripción'}</span>
                        <span>{formatCurrency(gasto.monto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información del Evento */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Información del Evento</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Empresario</label>
              <p className="text-lg">{evento.empresario}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total de Gastos</label>
              <p className="text-lg">{resumen.totalGastos} gastos registrados</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rentabilidad</label>
              <p className={`text-lg font-medium ${
                resumen.rentable ? 'text-green-600' : 'text-red-600'
              }`}>
                {resumen.rentable ? 'Rentable' : 'No rentable'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}