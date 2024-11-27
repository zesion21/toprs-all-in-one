import { decode } from "iconv-lite";
export const coding = (base64: any) => decode(base64, "gbk");
