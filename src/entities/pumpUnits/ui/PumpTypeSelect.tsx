import { Box, MenuItem, Select, Typography } from "@mui/material";

type Props = {
  connectionType: number;
  setConnectionType: (value: number) => void;
};

const PumpTypeSelect = ({ connectionType, setConnectionType }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 1.25,
        px: { xs: 1.25, sm: 1.5 },
        py: 1,
        borderRadius: 2.5,
        bgcolor: "#ffffff",
        border: "1px solid rgba(30, 41, 59, 0.08)",
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.07)",
      }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: "#1e293b",
          letterSpacing: 0.2,
        }}>
        Тип соединения насосов
      </Typography>
      <Select
        size="small"
        value={connectionType}
        onChange={(e) => setConnectionType(Number(e.target.value))}
        sx={{
          minWidth: { xs: "100%", sm: 240 },
          borderRadius: 1.5,
          bgcolor: "#f8fbff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(30, 41, 59, 0.16)" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(30, 41, 59, 0.28)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1a365d", borderWidth: 1.5 },
          "& .MuiSelect-select": {
            fontSize: "0.82rem",
            fontWeight: 600,
            py: 0.85,
          },
        }}>
        <MenuItem value={2} sx={{ fontSize: "0.82rem" }}>
          Параллельное
        </MenuItem>
        <MenuItem value={1} sx={{ fontSize: "0.82rem" }}>
          Последовательное
        </MenuItem>
        <MenuItem value={0} sx={{ fontSize: "0.82rem" }}>
          Одиночное
        </MenuItem>
      </Select>
    </Box>
  );
};

export default PumpTypeSelect;
