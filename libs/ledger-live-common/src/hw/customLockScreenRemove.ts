import {
  TransportStatusError,
  UnexpectedBootloader,
  StatusCodes,
  UserRefusedOnDevice,
} from "@ledgerhq/errors";
import Transport from "@ledgerhq/hw-transport";
import { Observable, from, of, throwError } from "rxjs";
import { withDevice } from "./deviceAccess";
import { catchError, delay, mergeMap } from "rxjs/operators";
import getDeviceInfo from "./getDeviceInfo";
import { ImageDoesNotExistOnDevice } from "../errors";

export type RemoveImageEvent =
  | {
      type: "unresponsiveDevice";
    }
  | {
      type: "removeImagePermissionRequested";
    }
  | {
      type: "imageRemoved";
    };

export type Input = {
  deviceId: string;
  request: Record<string, unknown>;
};

/**
 * Clear an existing custom image from the device, we could argue this would need to be
 * a task and a command, separated, but we are not quite there yet so I'm leaving them in
 * the same file. Not totally convinced but here we are.
 */
export const command = async (transport: Transport): Promise<void> => {
  const res = await transport.send(0xe0, 0x63, 0x00, 0x00, Buffer.from([]), [
    StatusCodes.OK,
    StatusCodes.DEVICE_IN_RECOVERY_MODE,
    StatusCodes.USER_REFUSED_ON_DEVICE,
    StatusCodes.CUSTOM_IMAGE_EMPTY,
    StatusCodes.UNKNOWN_APDU,
  ]);

  const status = res.readUInt16BE(res.length - 2);

  switch (status) {
    case StatusCodes.OK:
      return;
    case StatusCodes.CUSTOM_IMAGE_EMPTY:
      throw new ImageDoesNotExistOnDevice();
    case StatusCodes.DEVICE_IN_RECOVERY_MODE:
      throw new UnexpectedBootloader();
    case StatusCodes.USER_REFUSED_ON_DEVICE:
      throw new UserRefusedOnDevice();
  }
  throw new TransportStatusError(status);
};

export default function removeImage({ deviceId }: Input): Observable<RemoveImageEvent> {
  return withDevice(deviceId)(
    transport =>
      new Observable<RemoveImageEvent>(subscriber => {
        const timeoutSub = of<RemoveImageEvent>({
          type: "unresponsiveDevice",
        })
          .pipe(delay(1000))
          .subscribe(e => subscriber.next(e));

        const sub = from(getDeviceInfo(transport))
          .pipe(
            mergeMap(async () => {
              timeoutSub.unsubscribe();
              subscriber.next({ type: "removeImagePermissionRequested" });
              await command(transport);
              subscriber.next({ type: "imageRemoved" });
              subscriber.complete();
            }),
            catchError(e => {
              subscriber.error(e);
              return throwError(() => e);
            }),
          )
          .subscribe();

        return () => {
          timeoutSub.unsubscribe();
          sub.unsubscribe();
        };
      }),
  );
}
