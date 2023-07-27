import os

from enum import Enum


class Provider(str, Enum):
    openai = "openai"
    stable_diffusion = "stable_diffusion"
    none = "none"


class Environment(str, Enum):
    dev = "DEV"
    staging = "STAGING"
    production = "PRODUCTION"


def current_environment():
    env_var = os.environ.get("WUG_ENV")
    if env_var == Environment.staging.value:
        return Environment.staging
    if env_var == Environment.production.value:
        return Environment.production
    return Environment.dev


ENV = current_environment()

site_domain_by_env = {
    Environment.dev: "http://127.0.0.1:4000",
    Environment.staging: "https://wug-staging.azurewebsites.net",
    Environment.production: "https://wug-production.azurewebsites.net",
}


def current_domain():
    return site_domain_by_env.get(ENV)
