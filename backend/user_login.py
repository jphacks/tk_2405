import json
import logging
import os

import boto3
import psycopg2

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def connect_db():
    conn = psycopg2.connect(
        host=os.environ["db_host"],
        dbname=os.environ["db_name"],
        port=os.environ["db_port"],
        user=os.environ["db_user"],
        password=os.environ["db_pass"]
    )
    logger.info("SUCCESS: Connection to RDS Aurora instance succeeded")
    return conn


def lambda_handler(event, context):
    status_code = 200
    query = json.loads(event.get("queryStringParameters", "{}") if event.get("queryStringParameters", "{}") else "{}")
    body = json.loads(event.get("body", "{}") if event.get("body", "{}") else "{}")
    if not all(key in body for key in ("user_id", "password")):
        status_code = 400
        response_body = {
            "message": "Bad Request"
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(f"SELECT user_name, password FROM users WHERE user_id='{body["user_id"]}';")
    result = cur.fetchone()
    if not result:
        status_code = 404
        response_body = {
            "message": f"No such user_id was found.",
        }
    else:
        user_name, password = result
        if body["password"] != password:
            status_code = 403
            response_body = {
                "message": f"Password is not correct."
            }
        else:
            status_code = 200
            response_body = {
                "user_id": body["user_id"],
                "user_name": user_name
            }
    return {"statusCode": status_code, "body": json.dumps(response_body)}
