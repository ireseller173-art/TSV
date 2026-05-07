import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';

export interface MessageContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onReact?: () => void;
  isSentByCurrentUser?: boolean;
}

export function MessageContextMenu({
  visible,
  onClose,
  onDelete,
  onEdit,
  onReply,
  onForward,
  onReact,
  isSentByCurrentUser = false,
}: MessageContextMenuProps) {
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
            {/* Reply */}
            {onReply && (
              <TouchableOpacity
                onPress={() => handleAction(onReply)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol name="arrowshape.turn.up.left" size={20} color={colors.primary} />
                <Text className="text-foreground font-medium flex-1">{t('chat.reply')}</Text>
              </TouchableOpacity>
            )}

            {/* React */}
            {onReact && (
              <TouchableOpacity
                onPress={() => handleAction(onReact)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol name="face.smiling" size={20} color={colors.primary} />
                <Text className="text-foreground font-medium flex-1">{t('chat.react')}</Text>
              </TouchableOpacity>
            )}

            {/* Forward */}
            {onForward && (
              <TouchableOpacity
                onPress={() => handleAction(onForward)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol name="arrowshape.turn.up.right" size={20} color={colors.primary} />
                <Text className="text-foreground font-medium flex-1">{t('chat.forward')}</Text>
              </TouchableOpacity>
            )}

            {/* Edit - only for sent messages */}
            {isSentByCurrentUser && onEdit && (
              <TouchableOpacity
                onPress={() => handleAction(onEdit)}
                className="flex-row items-center gap-3 px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <IconSymbol name="pencil" size={20} color={colors.primary} />
                <Text className="text-foreground font-medium flex-1">{t('chat.edit')}</Text>
              </TouchableOpacity>
            )}

            {/* Delete - only for sent messages */}
            {isSentByCurrentUser && onDelete && (
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
