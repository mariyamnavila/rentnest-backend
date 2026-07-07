export interface ICreateRentalRequestPayload {
    propertyId: string;
    startDate: string;
    endDate: string;
    message?: string;
}

export type TUpdateRentalRequest = Partial<ICreateRentalRequestPayload>;
