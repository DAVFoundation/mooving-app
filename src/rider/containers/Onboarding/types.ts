import { TextStyle } from 'react-native';

export interface ISlide {
    key: string;
    index: number;
    titleStyle: TextStyle;
    startTime: number;
    endTime: number;
}

interface ILastSlide {
    key: string;
    index: number;
}

export type Slide = ISlide | ILastSlide;

export interface IProgressEvent {
    currentTime: number;
    playableDuration: number;
    seekableDuration: number;
}
