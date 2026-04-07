import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CurvePointDto, PumpDto } from 'entities/pumpDatabase/types/pumpTypes';

const BORDER = '1px solid rgba(0, 0, 0, 0.12)';
const HEADER_BG = 'grey.100';
const BAND_FILL = 'rgba(46, 125, 50, 0.16)';
const LINE_STROKE = '#c62828';

type Props = {
  hideHeader?: boolean;
  pump: PumpDto | null;
  curvePoints: CurvePointDto[];
};

function buildChartModel(pump: PumpDto | null, curvePoints: CurvePointDto[]) {
  if (!pump) {
    return {
      data: [] as { rate: number; head: number; efficiency: number }[],
      xMin: 0,
      xMax: 1,
      band: null as { x1: number; x2: number } | null,
    };
  }

  const data = [...curvePoints]
    .sort((a, b) => a.rate - b.rate)
    .map((p) => ({ rate: p.rate, head: p.head, efficiency: p.efficiency }));

  let lo = Math.min(pump.minRate, pump.maxRate);
  let hi = Math.max(pump.minRate, pump.maxRate);
  if (hi - lo < 1e-9) {
    const d = Math.abs(lo) * 0.05 + 0.5;
    lo -= d;
    hi += d;
  }

  const rateVals = data.map((d) => d.rate);
  const xs = [...rateVals, lo, hi].filter((x) => Number.isFinite(x));
  let xMin = xs.length ? Math.min(...xs) : 0;
  let xMax = xs.length ? Math.max(...xs) : 1;
  if (xMin === xMax) {
    xMin -= 1;
    xMax += 1;
  }
  const pad = Math.max((xMax - xMin) * 0.08, 1e-6);

  return {
    data,
    xMin: xMin - pad,
    xMax: xMax + pad,
    band: { x1: Math.min(pump.minRate, pump.maxRate), x2: Math.max(pump.minRate, pump.maxRate) },
  };
}

export default function PumpCurveCharts({
  hideHeader = false,
  pump,
  curvePoints,
}: Props) {
  const theme = useTheme();
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));

  const chartMargin = useMemo(
    () =>
      isXlUp
        ? { top: 14, right: 22, left: 12, bottom: 36 }
        : { top: 8, right: 12, left: 4, bottom: 28 },
    [isXlUp],
  );

  const tickFs = isXlUp ? 12 : 10;
  const labelFs = isXlUp ? 12 : 11;
  const dotR = isXlUp ? 4 : 3;
  const lineW = isXlUp ? 2.5 : 2;

  const { data, xMin, xMax, band } = useMemo(
    () => buildChartModel(pump, curvePoints),
    [pump, curvePoints],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        border: BORDER,
        borderRadius: 1,
        bgcolor: HEADER_BG,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {!hideHeader ? (
        <Box
          sx={{
            px: { xs: 1.5, xl: 2 },
            py: { xs: 1, xl: 1.25 },
            borderBottom: BORDER,
            bgcolor: HEADER_BG,
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xl: '1rem' } }}>
            {pump ? 'Кривые' : 'Диаграммы'}
          </Typography>
          {!pump && (
            <Typography variant="caption" color="text.secondary">
              Выберите насос слева
            </Typography>
          )}
        </Box>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          p: { xs: 0.5, xl: 0.75 },
        }}
      >
        {!pump ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Нет данных для графиков
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" />
                  {band ? (
                    <ReferenceArea
                      x1={band.x1}
                      x2={band.x2}
                      fill={BAND_FILL}
                      stroke="none"
                    />
                  ) : null}
                  <XAxis
                    type="number"
                    dataKey="rate"
                    domain={[xMin, xMax]}
                    tick={{ fontSize: tickFs }}
                    label={{
                      value: 'Расход, м³/ч',
                      position: 'bottom',
                      offset: 0,
                      fontSize: labelFs,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: tickFs }}
                    label={{
                      value: 'Напор, м',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: labelFs },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => [
                      typeof v === 'number'
                        ? v.toLocaleString('ru-RU', { maximumFractionDigits: 4 })
                        : String(v ?? ''),
                      '',
                    ]}
                    labelFormatter={(l) => `Расход: ${Number(l).toLocaleString('ru-RU')} м³/ч`}
                  />
                  <Line
                    type="monotone"
                    dataKey="head"
                    stroke={LINE_STROKE}
                    strokeWidth={lineW}
                    dot={{ r: dotR, fill: '#111' }}
                    isAnimationActive={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" />
                  {band ? (
                    <ReferenceArea
                      x1={band.x1}
                      x2={band.x2}
                      fill={BAND_FILL}
                      stroke="none"
                    />
                  ) : null}
                  <XAxis
                    type="number"
                    dataKey="rate"
                    domain={[xMin, xMax]}
                    tick={{ fontSize: tickFs }}
                    label={{
                      value: 'Расход, м³/ч',
                      position: 'bottom',
                      offset: 0,
                      fontSize: labelFs,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: tickFs }}
                    label={{
                      value: 'КПД, %',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: labelFs },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => [
                      typeof v === 'number'
                        ? v.toLocaleString('ru-RU', { maximumFractionDigits: 4 })
                        : String(v ?? ''),
                      '',
                    ]}
                    labelFormatter={(l) => `Расход: ${Number(l).toLocaleString('ru-RU')} м³/ч`}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke={LINE_STROKE}
                    strokeWidth={lineW}
                    dot={{ r: dotR, fill: '#111' }}
                    isAnimationActive={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}
