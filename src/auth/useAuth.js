import {useMemo, useEffect} from "react";
import {checkExistingSession, authorize} from "./authService";
import {removeAuthParams} from "../stores/UrlManager";

export const useAuth = (setUser) => {
  const {code, is_test = "false"} = useMemo(
    () =>
      Array.from(new URL(window.location.href).searchParams.entries()).reduce(
        (params, [key, value]) => {
          params[key] = value;
          return params;
        },
        {}
      ),
    []
  );

  useEffect(() => {
    const auth = async () => {
      const response = await checkExistingSession();

      console.log(response.email);

      response && response.isOk && response.email
        ? setUser(response.email)
        : setUser(null);

      if (code) {
        const response = await authorize(code, is_test === "true");

        if (response && response.isOk && response.email) {
          setUser(response.email);
        } else {
          console.error("Login not successful.");
        }

        removeAuthParams();
      }
    };

    auth();
  }, [code, is_test]);
};
