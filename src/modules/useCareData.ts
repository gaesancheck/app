import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { showCareError } from "../components/CareUI";
import { careData, type CareData } from "./careData";

export default function useCareData() {
    const [data, setData] = useState<CareData | null>(null);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);
    useFocusEffect(
        useCallback(() => {
            let active = true;
            setFailed(false);
            careData
                .get()
                .then(value => {
                    if (active) setData(value);
                })
                .catch(error => {
                    if (active) {
                        setFailed(true);
                        showCareError(error);
                    }
                });
            return () => {
                active = false;
            };
        }, [revision])
    );
    return { "data": data, "setData": setData, "failed": failed, "retry": () => setRevision(value => value + 1) };
}
