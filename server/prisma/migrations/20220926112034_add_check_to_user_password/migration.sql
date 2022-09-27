ALTER TABLE "User"
ADD CONSTRAINT "user_password_check"
CHECK(LENGTH(password) > 8);
