export enum UserInputNames {
    YES = "Y",
    NO = "n",
    ONE = "one",
    ALL = "all"
};

export interface UserInputData {
    originFileName: string;
    originPointSelect: string;
    originPointLen: number;
    destinationFileName: string;
    destinationPointSelect: string;
    destinationPointLen: number;
    outputFileName: string;
}