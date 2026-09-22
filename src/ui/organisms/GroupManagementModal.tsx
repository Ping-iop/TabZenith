import React, { useState, useEffect } from 'react';
import { Modal } from '../atoms/Modal';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import {
  CHROME_GROUP_COLORS,
  ChromeGroupColor,
  GROUP_COLOR_CLASSES,
} from '../tokens/colors.tokens';
import { cn } from '../utils/cn';

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, color: ChromeGroupColor) => void;
  initialTitle?: string;
  initialColor?: ChromeGroupColor;
  mode?: 'create' | 'edit';
}

export const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTitle = '',
  initialColor = 'blue',
  mode = 'create',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState<ChromeGroupColor>(initialColor);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setColor(initialColor);
      setError(null);
    }
  }, [isOpen, initialTitle, initialColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor introduce un nombre para el grupo');
      return;
    }
    onSave(title.trim(), color);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Nuevo Grupo de Pestañas' : 'Editar Grupo de Pestañas'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-content-secondary uppercase mb-1.5">
            Nombre del Grupo
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="ej. Investigación Llama, Finanzas, Dev..."
            autoFocus
            error={error || undefined}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-content-secondary uppercase mb-2">
            Color del Grupo (16 Colores Disponibles)
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {CHROME_GROUP_COLORS.map((c) => {
              const isSelected = color === c;
              const colorInfo = GROUP_COLOR_CLASSES[c];
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all flex items-center justify-center border-2',
                    colorInfo.dot,
                    isSelected
                      ? 'ring-2 ring-content-primary ring-offset-2 ring-offset-surface-card scale-110 border-white'
                      : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                  )}
                  title={c}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {mode === 'create' ? 'Crear Grupo' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
