import datetime
import json
import logging
import os
import random
import sys
import site

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
    query_param = event.get("queryStringParameters", {}) if event.get("queryStringParameters", {}) else {}
    path_param = event.get("pathParameters", {}) if event.get("pathParameters", {}) else {}
    body = json.loads(event.get("body", "{}") if event.get("body", "{}") else "{}")
    
    if not all(key in query_param for key in ("user_id",)):
        status_code = 400
        response_body = {
            "message": "Bad Request"
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(f"SELECT user_id FROM users WHERE user_id = '{query_param["user_id"]}';")
    if cur.fetchone():
        cur.execute(f"UPDATE users SET current_status = 0 WHERE user_id = '{query_param["user_id"]}';")
        try:
            cur.execute(f"DELETE FROM room_participants WHERE user_id = '{query_param["user_id"]}';")
            conn.commit()
        except Exception:
            pass
        status_code = 200
        response_body = {}
    else:
        status_code = 404
        response_body = {
            "message": "No such user exists."
        }
    return {"statusCode": status_code, "body": json.dumps(response_body)}
