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
    query = event.get("queryStringParameters", {}) if event.get("queryStringParameters", {}) else {}
    body = event.get("body", {}) if event.get("body", {}) else {}
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(f"SELECT user_name FROM users WHERE user_id='{body["user_id"]}'")
    if cur.fetchone():
        status_code = 409
        response_body = {
            "message": f"'{body["user_id"]}' already exists."
        }
    else:
        cur.execute(f"INSERT INTO users (user_id, user_name, password) VALUES ('{body["user_id"]}', '{body["user_name"]}', '{body["password"]}');")
        conn.commit()
        status_code = 200
        response_body = {
            "user_id": body["user_id"]
        }
    return {"statusCode": status_code, "body": json.dumps(response_body)}
