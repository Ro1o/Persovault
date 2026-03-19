import qrcode
import json


def generate_passport_qr(passport: dict, filename="passport_qr.png"):
    passport_string = json.dumps(passport, sort_keys=True)

    qr = qrcode.make(passport_string)
    qr.save(filename)

    return filename