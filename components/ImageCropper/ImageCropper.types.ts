import { ReactCropperProps } from 'react-cropper';

export interface ImageCropperProps extends ReactCropperProps {
    onChange: (e: any) => void;
    image: string;
    instance?: Cropper;
}

export enum CropModes {
    FREE_RATIO = 'freeRatio',
    '4/3' = '4/3',
    '16/9' = '16/9',
    AVATAR = 'avatar',
}
