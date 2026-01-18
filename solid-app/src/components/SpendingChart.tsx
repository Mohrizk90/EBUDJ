import { Show, onMount } from 'solid-js';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface SpendingChartProps {
  data: { category: string; total: number }[];
}

export default function SpendingChart(props: SpendingChartProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let chartInstance: ChartJS | undefined;

  onMount(() => {
    if (canvasRef) {
      chartInstance = new ChartJS(canvasRef, {
        type: 'doughnut',
        data: getChartData(),
        options: chartOptions,
      });
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });

  const getChartData = (): ChartData<'doughnut'> => {
    const categories = props.data.map(item => item.category);
    const amounts = props.data.map(item => item.total);
    
    // Generate colors for each category
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // blue
      'rgba(16, 185, 129, 0.8)',   // green
      'rgba(249, 115, 22, 0.8)',   // orange
      'rgba(139, 92, 246, 0.8)',   // purple
      'rgba(236, 72, 153, 0.8)',   // pink
      'rgba(234, 179, 8, 0.8)',    // yellow
      'rgba(20, 184, 166, 0.8)',   // teal
      'rgba(239, 68, 68, 0.8)',    // red
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#374151',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Show when={props.data.length > 0}>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Spending Distribution
        </h2>
        <div style={{ height: '300px' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </Show>
  );
}
