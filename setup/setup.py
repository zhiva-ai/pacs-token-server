#!/usr/bin/env python3
import os
import sys
import string
import random
import bcrypt
from pathlib import Path

## characters to generate password from
characters = list(string.ascii_letters + string.digits + "!@#$%^&*()")

def generate_random_password(length = 12):
	## shuffling the characters
	random.shuffle(characters)

	## picking random characters from the list
	password = []
	for i in range(length):
		password.append(random.choice(characters))

	## shuffling the resultant password
	random.shuffle(password)

	## converting the list to string
	return "".join(password)


if __name__ == "__main__":
    dbAdminPassword = generate_random_password()
    dbUserPassword = generate_random_password()
    authAdminPassword = input("Enter the admin password: ")
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(authAdminPassword.encode('utf-8'), salt)

    x = f"""ZHIVA_AUTH_PORT=4000
ZHIVA_MONGO_ADMIN=admin
ZHIVA_MONGO_ADMIN_PASSWORD={dbAdminPassword}
ZHIVA_MONGO_USER=user
ZHIVA_MONGO_PASSWORD={dbUserPassword}
ZHIVA_MONGO_DB=zhiva_db
ZHIVA_AUTH_ADMIN_PASSWORD={hashed.decode("utf-8")}
ZHIVA_AUTH_ALLOWED_ORIGINS=https://localhost:*"""

    with open(".env","w+") as f:
        f.writelines(x)

    print("Configuration stored into .env file")
    exit()