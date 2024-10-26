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
    
    if event["httpMethod"] == "GET":
        if not all(key in query_param for key in ("user_id",)):
        status_code = 400
        response_body = {
            "message": "Bad Request"
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
        conn = connect_db()
        cur = conn.cursor()
        cur.execute(f"SELECT current_status FROM users WHERE user_id = '{query_param["user_id"]}';")
        result = cur.fetchone()
        if result:
            status_code = 200
            response_body = {
                "user_id": query_param["user_id"],
                "current_status": result[0]
            }
        else:
            status_code = 404
            response_body = {
                "message": "No such user exists."
            }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    elif event["httpMethod"] == "POST":
        if not all(key in query_param for key in ("user_id", "status")):
            status_code = 400
            response_body = {
                "message": "Bad Request"
            }
        cur.execute(f"SELECT current_status FROM users WHERE user_id = '{query_param["user_id"]}';")
        result = cur.fetchone()
        if result:
            status_code = 200
            response_body = {
                "user_id": query_param["user_id"],
                "prev_status": result[0]
            }
            cur.execute(f"UPDATE users SET current_status = {query_param["status"]} WHERE user_id = '{query_param["user_id"]}';")
            conn.commit()
            response_body["current_status"] = query_param["status"]
        else:
            status_code = 404
            response_body = {
                "message": "No such user exists."
            }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    else:
        status_code = 403
        response_body = {
            "message": "Forbidden"
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
