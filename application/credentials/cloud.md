# Cloud Instance Access (Checkpoint 3)

## Instructions for instance access

Step 1 - 3 are for people who want their own permissions with the instance...

Step 1: Generate a ssh key pair on your local machine

Step 2: Send the public key to a person who has access to the aws console so they can inject it into the ubuntu instance

Step 3: Put the pem file within the /application/credentials section of your files

Step 4: cd into directory where the access key is located. It should be /application/credentials

Step 5: run "chmod 600 [file.pem]" in this case "chmod 600 ARKHA_VibeCheck"

Step 6: Once steps above are completed, run "ssh -i [file.pem].pem ubuntu@[elastic_ip]" in this case "ssh -i ARKHA_VibeCheck.pem ubuntu@3.138.212.58"

You should be able to access it here

### key management

key management is handeled by 1 unprotected key file. Subject to change for more security

### login procedures

For login into the browser console and dashboard, you send your name and email information so that you can get a username and password set up with the permissions.

### PEM files

ARKHA_VibeCheck.pem

### Common Trouble Shooting

problem:
UNPROTECTED PRIVATE KEY FILE! 

solution:
run "chmod 600 [file.pem]"
or
follow steps 1-3

