import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  DialogTitle,
  IconButton,
  Box,
} from '@mui/material';
import { X } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  loading = false,
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '32px',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.25, pr: 6 }}>
        {title}
        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ position: 'absolute', right: 10, top: 10 }}
        >
          <X size={16} />
        </IconButton>
      </DialogTitle>
      <Divider />
      {description ? (
        <DialogContent sx={{ pt: 1.25, pb: 1.25 }}>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
      ) : null}
      <Divider />
      <DialogActions sx={{ px: 2, py: 1.25, justifyContent: 'space-between' }}>
        <Button
          onClick={() => void onConfirm()}
          color={destructive ? 'error' : 'primary'}
          variant="text"
          disabled={loading}
          sx={{
            minWidth: 86,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 500,
            ...(destructive && {
              color: 'error.main',
              bgcolor: 'error.50',
            }),
          }}
        >
          {loading ? '...' : confirmText}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={onClose}
          disabled={loading}
          variant="contained"
          color="primary"
          sx={{
            minWidth: 108,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {cancelText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
