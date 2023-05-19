import ShortUniqueId from "short-unique-id";

const uidFactory = new ShortUniqueId.default({dictionary: "alphanum"});

export const newUid = () => uidFactory.stamp(12);
export const timestampFromUid = (uid: string) => uidFactory.parseStamp(uid)

