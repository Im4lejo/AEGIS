import {
    loginUser,
    registerUser,
} from "../../models/api/apiClient";

export async function authenticateUser(credentials, updateSession) {
    const response = await loginUser({
        email: credentials.email.trim(),
        password: credentials.password,
    });
    const { token, usuario } = response.data;

    if (!token || !usuario) {
        throw new Error(
            "La respuesta del servidor no contiene el token y los datos del usuario."
        );
    }

    await updateSession(token, usuario);
}

export async function registerAccount(values) {
    const { passwordConfirmation, ...userData } = values;

    return registerUser({
        ...userData,
        password_confirmation: passwordConfirmation,
    });
}
