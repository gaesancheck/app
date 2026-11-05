import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { CareScreen, CareText, Field, LoadingState, ErrorState, selectCarePhotos, showCareError, careColors } from "@/components/CareUI";
import useCareData from "@/modules/useCareData";
import { careData } from "@/modules/careData";
import { APIMy } from "@/modules/rest/my";
import Avatar from "@/assets/svg/account-emergency/avatar.svg";
import EditPhoto from "@/assets/svg/account-emergency/edit-photo.svg";

export default function Page() {
    const { data, failed, retry } = useCareData();
    const [id, setId] = useState("");
    const [picture, setPicture] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => { if (data) { setId(data.account.name); setPicture(data.account.profile ?? ""); } }, [data]);
    const save = async () => {
        if (busy || !data || !id.trim()) return;
        setBusy(true);
        try {
            const response = await APIMy.changeInfo({ "name": id.trim(), "picture": picture });
            if (!response.success) throw new Error(response.data.message);
            await careData.update(current => ({ ...current, "account": { ...current.account, "name": id.trim(), "profile": picture } }));
            router.back();
        } catch (error) { showCareError(error); } finally { setBusy(false); }
    };
    return <CareScreen title="계정" action={<Pressable disabled={busy || !id.trim()} onPress={() => void save()}><CareText style={{ "fontSize": 20, "color": busy || !id.trim() ? "#9CA3AF" : careColors.green }}>완료</CareText></Pressable>}>
        {failed ? <ErrorState onRetry={retry} /> : !data ? <LoadingState /> : <>
            <Pressable accessibilityRole="button" accessibilityLabel="프로필 사진 변경" style={{ "alignSelf": "center", "marginTop": 8, "marginBottom": 27, "width": 104, "height": 105, "alignItems": "center", "justifyContent": "center" }} onPress={async () => {
                try { const photos = await selectCarePhotos(); if (photos[0]) setPicture(photos[0]); } catch (error) { showCareError(error); }
            }}>{picture ? <Image source={{ "uri": picture }} style={{ "width": 100, "height": 100, "borderRadius": 50, "borderWidth": 1, "borderColor": careColors.green }} /> : <View style={{ "width": 100, "height": 100, "alignItems": "center", "justifyContent": "center", "borderRadius": 50, "backgroundColor": "#ECEEE6" }}><Avatar /></View>}
                <EditPhoto style={{ "position": "absolute", "right": 0, "bottom": 0 }} />
            </Pressable>
            <Field compact label="닉네임" value={id} onChangeText={setId} autoCapitalize="none" />

        </>}
    </CareScreen>;
}
