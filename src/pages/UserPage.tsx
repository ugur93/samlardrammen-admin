import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router";
import { Button, Card, CardContent, Table, TableRow, TableCell, TableBody, TableHead, TextField, InputLabel } from "@mui/material";
import { Label } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";

interface Address {
    street: string;
    city: string;
    zipCode: string;
}

interface Relation {
    type: "Child" | "Spouse";
    firstname: string;
    lastname: string;
}

interface Payment {
    entity: string;
    year: number;
    amount: number;
    paid: boolean;
    accountInfo?: string;
}

interface User {
    firstname: string;
    lastname: string;
    birthdate: string;
    email: string;
    phoneNumber: string;
    address: Address;
    relations: Relation[];
    payments: Payment[];
}

const mockUser: User = {
    firstname: "John",
    lastname: "Doe",
    birthdate: "1985-06-15",
    email: "john.doe@example.com",
    phoneNumber: "123-456-7890",
    address: {
        street: "123 Main St",
        city: "Metropolis",
        zipCode: "12345",
    },
    relations: [
        { type: "Child", firstname: "Jane", lastname: "Doe" },
        { type: "Spouse", firstname: "Mary", lastname: "Doe" },
    ],
    payments: [
        { entity: "Gym Membership", year: 2023, amount: 300, paid: true, accountInfo: "Account: 123-456-789, Bank: XYZ" },
        { entity: "Gym Membership", year: 2022, amount: 300, paid: false, accountInfo: "Account: 123-456-789, Bank: XYZ" },
        { entity: "Book Club", year: 2023, amount: 50, paid: false, accountInfo: "Account: 987-654-321, Bank: ABC" },
        { entity: "Book Club", year: 2022, amount: 50, paid: true, accountInfo: "Account: 987-654-321, Bank: ABC" },
    ],
};

export const UserDetailsPage: React.FC = () => {
    const { user } = useAppContext();
    const [showPaymentDetails, setShowPaymentDetails] = useState<Record<string, boolean>>({});
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm<User>({ defaultValues: mockUser });

    const mutation = useMutation({
        mutationFn: (updatedUser: User) => {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    console.log("Updated user information", updatedUser);
                    resolve();
                }, 1000);
            });
        }
    });

    const onSubmit = (data: User) => {
        mutation.mutate(data, {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        reset(mockUser);
    };

    // const groupedPayments = [].reduce((acc, payment) => {
    //     if (!acc[payment.entity]) acc[payment.entity] = [];
    //     acc[payment.entity].push(payment);
    //     return acc;
    // }, {} as Record<string, Payment[]>);

    const togglePaymentDetails = (entity: string) => {
        setShowPaymentDetails(prevState => ({ ...prevState, [entity]: !prevState[entity] }));
    };

    const handleRelationClick = (relation: Relation) => {
        navigate(`/relation-details/${relation.type.toLowerCase()}/${relation.firstname}-${relation.lastname}`);
    };

    const details = user?.details;
    if (!details) return null;
    return (
        <div className="p-6 flex justify-center">
            <div className="w-full max-w-4xl">
                <header className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md mb-6">
                    <h1 className="text-2xl font-bold">Uyelik</h1>
                    {!isEditing && <Button className="bg-white text-blue-600" onClick={handleEditClick}>Update Information</Button>}
                </header>

                <Card className="mb-6">
                    <CardContent>
                        <h2 className="text-xl font-semibold pb-4">Detajlar</h2>
                        {isEditing ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-4">
                                <TextField size="small" label="Isim" {...register("firstname")} placeholder="Isim" className="border p-2 w-full" />
                                <TextField size="small" label="Soy isim" {...register("lastname")} placeholder="Soyisim" className="border p-2 w-full mt-2" />
                                <TextField size="small" label="Dogum tarihi" type="date" {...register("birthdate")} className="border p-2 w-full" />
                                <TextField size="small" label="Epost" type="email" {...register("email")} className="border p-2 w-full" />
                                <TextField size="small" label="Telefon" type="text" {...register("phoneNumber")} className="border p-2 w-full" />
                                <div>
                                    <InputLabel className="pb-5">Address:</InputLabel>
                                    <div className="flex flex-col gap-4">
                                        <TextField size="small" label="Adress" {...register("address.street")} placeholder="Street" className="border p-2 w-full" />
                                        <TextField size="small" label="Sehir" {...register("address.city")} placeholder="City" className="border p-2 w-full mt-2" />
                                        <TextField size="small" label="Posta kodu" {...register("address.zipCode")} placeholder="Zip Code" className="border p-2 w-full mt-2" />
                                    </div>
                                </div>
                                <Button type="submit" className="bg-blue-600 text-white">Save</Button>
                            </form>
                        ) : (
                            <>
                                <p><strong>Isim:</strong> {details.name}</p>
                                <p><strong>Dogum tarihi:</strong> {details.person.birthdate ? format(new Date(details.person.birthdate), "dd/MM/yyyy") : ""}</p>
                                <p><strong>Email:</strong> {details.person.email}</p>
                                <p><strong>Telefon:</strong> {details.person.id}</p>
                                <p><strong>Address:</strong> {details.address?.addressLine1} {details.address?.addressLine2}, {details.address?.city}, {details.address?.postcode}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                {/* 
                <Card className="mb-6">
                    <CardContent>
                        <h2 className="text-xl font-semibold">Relations</h2>
                        {relations.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {relations.map((relation, index) => (
                                    <li key={index} className="cursor-pointer text-blue-600 underline" onClick={() => handleRelationClick(relation)}>
                                        {relation.type}: {relation.firstname} {relation.lastname}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No relations available.</p>
                        )}
                    </CardContent>
                </Card> */}

                {/* <Card className="mb-6">
                    <CardContent>
                        <h2 className="text-xl font-semibold">Uyelik</h2>
                        {Object.keys(groupedPayments).length > 0 ? (
                            Object.entries(groupedPayments).map(([entity, payments]) => (
                                <div key={entity} className="mb-4">
                                    <h3 className="text-lg font-medium mb-2">{entity}</h3>
                                    <Button className="text-blue-600 mb-2" onClick={() => togglePaymentDetails(entity)}>
                                        {showPaymentDetails[entity] ? "Hide Details" : "View Details"}
                                    </Button>
                                    {showPaymentDetails[entity] && payments[0]?.accountInfo && (
                                        <div className="bg-gray-50 p-2 mb-2">
                                            <p><strong>Account Info:</strong> {payments[0].accountInfo}</p>
                                        </div>
                                    )}
                                    <Table className="w-full">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Year</TableCell>
                                                <TableCell>Amount</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {payments.map((payment, index) => (
                                                <TableRow key={index} className={`${!payment.paid ? "bg-red-100" : ""}`}>
                                                    <TableCell>{payment.year}</TableCell>
                                                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                                    <TableCell>{payment.paid ? "Ødendi" : "Ødenmedi"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))
                        ) : (
                            <p>No payment records available.</p>
                        )}
                    </CardContent> */}
                {/* </Card> */}
            </div>
        </div >
    );
};

export default UserDetailsPage;
