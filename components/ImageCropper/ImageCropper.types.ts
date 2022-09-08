import { RcFile } from 'antd/lib/upload';
import { ReactElement } from 'react';
import { ReactCropperProps } from 'react-cropper';

export interface ImageCropperProps extends ReactCropperProps {
    onFileSelect?: (file?: RcFile) => void;
    mode?: CropModes;
    anchorElement?: ReactElement;
    uploadHandler?: (file: Blob | null) => Promise<void>;
}

export enum CropModes {
    FREE_RATIO = 'freeRatio',
    '4/3' = '4/3',
    '16/9' = '16/9',
    AVATAR = 'avatar',
}
