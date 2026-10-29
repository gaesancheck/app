import { RESTResponse, REST } from '.';

export type APIPost = {
    "id": string,
    /** UNIX Timestamp in milliseconds */
    "wroteAt": number,
    "title": string,
    "content": string,
    "hearts": number,
    "comments": number,
    "bookmarked": boolean,
    "attachments": {
        "id": string,
        "url": string
    }[]
};

export type APIPostDetails = Omit<APIPost, "comments"> & {
    "comments": APIPostComment[]
};

export type APIPostComment = {
    "id": string,
    "wroteBy": {
        "username": string,
        "profile"?: string
    },
    "content": string
}

export type APIPostCategory = "popular" | "recent" | "others";

type GETAPIPosts = Partial<{
    /** APIPost의 id 부터 (nextFrom 포스트 제외하고) 로드 */
    "nextFrom": string,
    "category": APIPostCategory,
    "query": string
}>;

type POSTAPIWriteNewPost = Omit<APIPost, "id" | "bookmarked" | "hearts" | "comments">;

type PUTAPIPostHeart = Partial<{
    "bookmark": boolean,
    "heart": boolean
}>;

export const APIPosts = {
    async getPosts(data: GETAPIPosts): Promise<RESTResponse<APIPost[], APIError>> {
        // GET /v1/posts
        // searchParams: GETAPIPost
        // status: 200 (APIPost[]), 404 (not found)
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "headers": {},
            "success": true,
            "data": [
                {
                    "id": "1",
                    "title": "강아지가 이상해요",
                    "content": "강아지가 이상해요. 강아지가 목욕탕을 너무 좋아해요. 장난이 아니라 진짜 바나나우유 들고 아저씨마냥 목욕탕에서 힐링을 해요 ㅜㅜ",
                    "hearts": 12,
                    "wroteAt": 1793295496322,
                    "comments": 5,
                    "bookmarked": false,
                    "attachments": [
                        {
                            "id": "1",
                            "url": "https://f.ny64.kr/photos/help.jpg"
                        },
                        {
                            "id": "2",
                            "url": "https://f.ny64.kr/photos/help.jpg"
                        }
                    ]
                },
                {
                    "id": "2",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "3",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "4",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "5",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "6",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "7",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "8",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "9",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "10",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "11",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "12",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "13",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                },
                {
                    "id": "14",
                    "title": "오늘 방신시장에서",
                    "content": "오늘 방신시장에서 무슨 일 있었나요? 저희 집 강아지가 와서 막 울길래 들어보니까 뽀삐가 왈왈이한테 공개고백했다가 차였다고 하더라고요.. 자세한거 알고계신 분 있으면 댓글로 알려주세요.",
                    "hearts": 12,
                    "comments": 5,
                    "bookmarked": true,
                    "attachments": [],
                    "wroteAt": new Date().getTime(),
                }
            ]
        };
    },
    async writeNewPost(data: POSTAPIWriteNewPost): Promise<RESTResponse<null, APIError>> {
        // POST /v1/posts
        // jsonBody: POSTAPIWriteNewPost
        // status: 204 (null), 401 (unauthorized) and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "headers": {},
            "success": true,
            "data": null
        };
    },
    async heartPost(data: PUTAPIPostHeart): Promise<RESTResponse<null, APIError>> {
        // PUT /v1/posts/:id
        // jsonBody: PUTAPIPostHeart
        // status: 204 (null), 401 (unauthorized) and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "headers": {},
            "success": true,
            "data": null
        };
    },
    async getPost(id: string): Promise<RESTResponse<APIPostDetails, APIError>> {
        // GET /v1/posts/:id
        // status: 200 (APIPostDetails), 404 (not found) and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "headers": {},
            "success": true,
            "data": {
                "id": "1",
                "title": "강아지가 이상해요",
                "content": "강아지가 이상해요. 강아지가 목욕탕을 너무 좋아해요. 장난이 아니라 진짜 바나나우유 들고 아저씨마냥 목욕탕에서 힐링을 해요 ㅜㅜ",
                "hearts": 12,
                "wroteAt": new Date().getTime(),
                "comments": [
                    {
                        "id": "a",
                        "wroteBy": {
                            "username": "호두"
                        },
                        "content": "저도 저럴때가 있었죠. ㅎㅎ 지금보니까 가끔씩 그때의 추억이 생각나네요."
                    },
                    {
                        "id": "b",
                        "wroteBy": {
                            "username": "호두"
                        },
                        "content": "저도 저럴때가 있었죠. ㅎㅎ 지금보니까 가끔씩 그때의 추억이 생각나네요."
                    },
                    {
                        "id": "c",
                        "wroteBy": {
                            "username": "호두"
                        },
                        "content": "저도 저럴때가 있었죠. ㅎㅎ 지금보니까 가끔씩 그때의 추억이 생각나네요."
                    },
                    {
                        "id": "d",
                        "wroteBy": {
                            "username": "호두"
                        },
                        "content": "저도 저럴때가 있었죠. ㅎㅎ 지금보니까 가끔씩 그때의 추억이 생각나네요."
                    },
                    {
                        "id": "e",
                        "wroteBy": {
                            "username": "호두"
                        },
                        "content": "저도 저럴때가 있었죠. ㅎㅎ 지금보니까 가끔씩 그때의 추억이 생각나네요."
                    }
                ],
                "bookmarked": false,
                "attachments": [
                    {
                        "id": "1",
                        "url": "https://f.ny64.kr/photos/help.jpg"
                    },
                    {
                        "id": "2",
                        "url": "https://f.ny64.kr/photos/help.jpg"
                    }
                ]
            }
        };
    },
    async deletePost(id: string): Promise<RESTResponse<null, APIError>> {
        // DELETE /v1/posts/:id
        // status: 204 (null), 401 (unauthorized) and more
        await new Promise(r => setTimeout(r, 500));

        return {
            "status": 200,
            "headers": {},
            "success": true,
            "data": null
        };
    }
};
