import json

def return_sitepackages():
    import os
    import site
    ret = {d: os.listdir(d) for d in site.getsitepackages()}
    return {"statusCode": 200, "body": json.dumps(ret)}

def lambda_handler(event, context):
    status_code = 200
    query = event.get("queryStringParameters", {}) if event.get("queryStringParameters", {}) else {}
    body = event.get("body", {}) if event.get("body", {}) else {}
    if "err" in query:
        status_code = 400
        response_body = {"message": "You can successfully "}
    else:
        status_code = 200
        response_body = {"query": query, "body": body}
    return {"statusCode": status_code, "body": json.dumps(response_body)}
