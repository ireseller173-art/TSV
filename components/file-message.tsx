import { View, Text, TouchableOpacity, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

interface FileMessageProps {
  fileName: string;
  fileType: string;
  fileSize?: number;
  fileUrl?: string;
  onPress?: () => void;
  isOwn?: boolean;
}

export function FileMessage({
  fileName,
  fileType,
  fileSize,
  fileUrl,
  onPress,
  isOwn = false,
}: FileMessageProps) {
  const colors = useColors();

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) {
      return 'photo';
    } else if (fileType.startsWith('video/')) {
      return 'video';
    } else if (fileType.startsWith('audio/')) {
      return 'music.note';
    } else if (fileType.includes('pdf')) {
      return 'doc';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'doc';
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return 'table';
    } else {
      return 'paperclip';
    }
  };

  const getFileSizeText = () => {
    if (!fileSize) return '';
    if (fileSize < 1024) return `${fileSize}B`;
    if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)}KB`;
    return `${(fileSize / (1024 * 1024)).toFixed(1)}MB`;
  };

  const isImage = fileType.startsWith('image/');

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-lg overflow-hidden ${isOwn ? 'bg-primary' : 'bg-surface'}`}
    >
      {isImage && fileUrl ? (
        <Image
          source={{ uri: fileUrl }}
          className="w-40 h-40 rounded-lg"
          resizeMode="cover"
        />
      ) : (
        <View className={`flex-row items-center gap-3 p-3 ${isOwn ? 'bg-primary' : 'bg-surface'}`}>
          <View className={`w-10 h-10 rounded-lg items-center justify-center ${isOwn ? 'bg-primary/20' : 'bg-primary/10'}`}>
            <IconSymbol
              name={getFileIcon() as any}
              size={20}
              color={isOwn ? 'white' : colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text
              className={`font-semibold ${isOwn ? 'text-white' : 'text-foreground'}`}
              numberOfLines={1}
            >
              {fileName}
            </Text>
            {fileSize && (
              <Text className={`text-xs ${isOwn ? 'text-white/70' : 'text-muted'}`}>
                {getFileSizeText()}
              </Text>
            )}
          </View>
          <IconSymbol
            name="arrow.down.circle"
            size={20}
            color={isOwn ? 'white' : colors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
