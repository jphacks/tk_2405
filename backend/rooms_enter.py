import datetime
import json
import logging
import os
import random
import sys
import site

import boto3
import psycopg2


THRESHOLD = 10 # min or longer lifetime
ROOM_CAPACITY = 4


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


def find_mostly_matched_room(cur, strength, duration):
    # durationと残存時間が近い運動強度strengthの部屋を探す．
    sql_query = f"""SELECT 
    r.room_id,
    COUNT(rp.participant_id) AS participant_count,
    r.training_duration - (EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 60) AS remain_lifetime
    FROM 
    rooms r
    LEFT JOIN 
    room_participants rp ON r.room_id = rp.room_id
    WHERE
    r.training_strength = {strength}
    GROUP BY 
    r.room_id, r.training_duration, r.created_at
    ORDER BY 
    remain_lifetime DESC,
    participant_count DESC;
    """
    cur.execute(sql_query)
    result = cur.fetchall()
    print("result", result)
    if result:
        for r in result:
            if int(r[2]) >= duration - THRESHOLD:
                continue
            else:
                if r[1] >= ROOM_CAPACITY:
                    continue
                else:
                    return r[0]
    return None


def lambda_handler(event, context):
    status_code = 200
    query = json.loads(event.get("queryStringParameters", "{}") if event.get("queryStringParameters", "{}") else "{}")
    body = json.loads(event.get("body", "{}") if event.get("body", "{}") else "{}")
    if not all(key in body for key in ("strength", "duration")):
        status_code = 400
        response_body = {
            "message": "Bad Request"
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    conn = connect_db()
    cur = conn.cursor()
    matched_room_id = find_mostly_matched_room(cur, body["strength"], body["duration"])
    if matched_room_id:
        status_code = 200
    else:
        status_code = 201
        # 部屋を新しく作る
        cur.execute(f"INSERT INTO rooms (training_duration, training_strength) VALUES ({body["duration"]}, {body["strength"]});")
        conn.commit()
        cur.execute("SELECT room_id FROM rooms ORDER BY created_at DESC;")
        result = cur.fetchone()
        if result:
            matched_room_id = result[0]
        else:
            status_code = 503
            response_body = {
                "message": "Failed to create new room."
            }
            return {"statusCode": status_code, "body": json.dumps(response_body)}
    response_body = {
        "room_id": f"r{matched_room_id}"
    }
    return {"statusCode": status_code, "body": json.dumps(response_body)}