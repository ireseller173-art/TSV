import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';

export interface ChatContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onPin?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  isPinned?: boolean;
  isMuted?: boolean;
}

export function ChatContextMenu({
  visible,
  onClose,
  onPin,
  onMute,
  onDelete,
  onArchive,
  isPinned = false,
  isMuted = false,
}: ChatContextMenuProps) {
  const colors = useColors();
  const { t } = useI18n();

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={onClose}
      >
        <View
          className="flex-1 bg-black/50 items-center justify-center"
          pointerEvents="box-none"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl mx-4 overflow-hidden"
            style={{
              borderColor: colors.border,
              borderWidth: 1,
              minWidth: 200,
            }}
          >
            {/* Pin/Unpin */}
            {onPin && (
              <TouchableOpacity
                onPress={() => handleAction(onPin)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol 
                  name={isPinned ? "pin.slash" : "pin"} 
                  size={20} 
                  color={colors.primary} 
                />
                <Text className="text-foreground font-medium flex-1">
                  {isPinned ? t('chat.unpin') : t('chat.pin')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Mute/Unmute */}
            {onMute && (
              <TouchableOpacity
                onPress={() => handleAction(onMute)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol 
                  name={isMuted ? "speaker.wave.2" : "speaker.slash"} 
                  size={20} 
                  color={colors.primary} 
                />
                <Text className="text-foreground font-medium flex-1">
                  {isMuted ? t('chat.unmute') : t('chat.mute')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Archive */}
            {onArchive && (
              <TouchableOpacity
                onPress={() => handleAction(onArchive)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol name="archivebox" size={20} color={colors.primary} />
                <Text className="text-foreground font-medium flex-1">{t('chat.archive')}</Text>
              </TouchableOpacity>
            )}

            {/* Delete */}
            {onDelete && (
              <TouchableOpacity
                onPress={() => handleAction(onDelete)}
                className="flex-row items-center gap-3 px-4 py-3"
              >
                <IconSymbol name="trash" size={20} color={colors.error} />
                <Text className="text-error font-medium flex-1">{t('chat.delete')}</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
