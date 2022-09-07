import { RcFile } from 'antd/lib/upload';
import { ReactCropperProps } from 'react-cropper';

export interface ImageCropperProps extends ReactCropperProps {
    onFileSelect?: (file?: RcFile) => void;
    mode?: CropModes;
}

export enum CropModes {
    FREE_RATIO = 'freeRatio',
    '4/3' = '4/3',
    '16/9' = '16/9',
    AVATAR = 'avatar',
}
