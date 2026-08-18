import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"
import { AppoinmentServices } from "./appointment.service";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
	const result = await AppoinmentServices.bookAppointment()

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});

const bookAppointmentcallback = catchAsync(async (req: Request, res: Response) => {
	const {executedPaymentResult, redirectUrl} = await  AppoinmentServices.bookAppointmentCallback(req.query)

    console.log({executedPaymentResult}, "callback controller")
    res.redirect(redirectUrl);
	// sendResponse(res, {
	// 	statusCode: httpStatus.OK,
	// 	success: true,
	// 	message: "User profile fetched successfully",
	// 	data: result,
	// });
});

export const AppointmentController ={
    bookAppointment,
    bookAppointmentcallback 
}